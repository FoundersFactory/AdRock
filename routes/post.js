const router = require("express").Router(); 
const fs = require("fs");
const sanitiser = require("./sanitiser.js");
const multer = require("multer");
const remove = require("remove");
const plist = require("plist");
const moment = require("moment");

const upload = multer(multer({ 
	dest: "./tmp",
	limits: {
		fileSize: 1024 * 1024 * 512
	},
	fileFilter: function(req, file, cb) {
		try {
			let extension = file.filename.split(".").pop().toLowerCase();
			console.log(file.filename);
			console.log(extension);
			if (extension.indexOf("ipa") !== -1 ||
				extension.indexOf("png") !== -1)
			{
				cb(null, true);
				console.log(":)");
			} else {
				console.log(":/");
				cb(null, false);
			}
		} catch (e) {
			console.log(":/");
			cb(null, false);
		}
	}
}));

//Uploading apps
router.post("/", upload.fields([{ name: "ipa", maxCount: 1 }, { name: "icon", maxCount: 1 }]), function(req, res) 
{		
	if (req.files == null || req.files.length == 0) {
		res.status(406).send("Where are the files?");
		return;
	}
	
	let ipaFile = null;
	let iconFile = null;
	
	console.log(req.body);
		
	try {
		ipaFile = req.files["ipa"];
		iconFile = req.files["icon"];
	} catch (e) {
		console.log("ERROR: post(/adrock/upload) + getting files -> " + e);
	}
	
	let erase = function() {
		try {
			let paths = [];
			if (ipaFile) paths.push(ipaFile.filename);
			if (iconFile) paths.push(iconFile.filename); 
			remove.removeSync(paths, { ignoreErrors: true, ignoreMissing: true });
		} catch (e) {
			console.log("ERROR: post(/adrock/upload) + removeSync -> " + e);
		}
	}
	
	let error = function(message) {
		erase();
		res.status(406).send(message);
	}
	
	if (ipaFile == null) {
		error("Where is the app?!");
		return;
	}
	
	sanitiser.post(req, function(path) {
		if (path == null) {
			error("What are you trying to do?");
			return;
		}
		
		//Getting the params we need
		let bundleId = null;
		let version = null;
		let name = null;		
		try {
		    bundleId = req.body["bundleId"].toLowerCase().split(" ").join("");
			version = req.body["version"];
			name = req.body["name"];
		}
		catch (e) {
			console.log("ERROR: post(/adrock/upload) + bundleId + version + name -> " + e);
		}
		if ((bundleId == null || bundleId.length == 0) ||
			(version == null || version.length == 0) ||
			(name == null || name.length == 0))
		{
			error("No params...");
		    return;
		}
		
		let rootPath = sanitiser.rootPath + "/" + bundleId;
		let indexPath = rootPath + "/index.html";
		let folderPath = rootPath + "/v" + version;
		let appPath = folderPath + "/app.ipa";
		let iconPath = rootPath + "/icon.png";
		
		try {
			//If we already have a folder named after the app's Bundle ID, we delete its index.html file
			remove.removeSync(indexPath, { ignoreErrors: true, ignoreMissing: true });
			//If we already have a version, we shall replace it
			remove.removeSync(folderPath, { ignoreErrors: true, ignoreMissing: true });
			//If we already have an icon, we shall replace it, but only if another one has been uploaded
			if (iconFile) {
				remove.removeSync(iconPath, { ignoreErrors: true, ignoreMissing: true });
			}
		} catch (e) {
			console.log("ERROR: post(/adrock/upload) + deleting stuff -> " + e);
		}
		
		try {
			//Now we save the app
			fs.renameSync(ipaFile.path, appPath);
			//And the icon
			if (iconFile) {
				fs.renameSync(iconFile.path, iconPath);
			}
		} catch (e) {
			console.log("ERROR: post(/adrock/upload) + moving stuff -> " + e);
			error("Oops... We couldn't save your app or your icon...");
			return;
		}
		
		//Next we fix the manifest
		try {
			let manifest = fs.readFileSync("./templates/manifest.plist", "utf8");
			manifest = manifest.replace("{IPA}", "https://bellapplab.xyz/adrock/" + bundleId + "/v" + version + "/app.ipa")
								.replace("{ICON}", "https://bellapplab.xyz/adrock/" + bundleId + "/icon.png")
								.replace("{ICON}", "https://bellapplab.xyz/adrock/" + bundleId + "/icon.png")
								.replace("{BUNDLE_ID}", bundleId)
								.replace("{VERSION}", version)
								.replace("{NAME}", name);
			fs.writeFileSync(folderPath + "/" + "manifest.plist", manifest);
		} catch (e) {
			console.log("ERROR: post(/adrock/upload) + fixing the manifest -> " + e);
			error("Oops... Something went wrong with the manifest file...");
			return;
		}
		
		//Then we fix the HTML
		try {
			let main = fs.readFileSync("./templates/main.html", "utf8");
			let listTemplate = fs.readFileSync("./templates/list.html", "utf8");
			let list = "";
			let elements = fs.readdirSync(rootPath);
			for (let i=0; i<elements.length; i++) {
				let element = elements[i];
				if (element.indexOf("v") !== -1) {
					list += listTemplate.replace("{BUNDLE_ID}", bundleId)
										.replace("{VERSION}", version)
										.replace("{VERSION}", version)
										.replace("{NAME}", name)
										.replace("{DATE}", moment().format("DD/MM/YYYY"));
				}
			}
			main = main.replace("{VERSIONS}", list);
			fs.writeFileSync(rootPath + "/" + "index.html", main);
		} catch (e) {
			console.log("ERROR: post(/adrock/upload) + fixing index.html -> " + e);
			error("Oops... Something went wrong with the index.html file...");
			return;
		}
		
		//TODO: get bitly URL
		
		//GREAT SUCCESS
		erase();
		res.status(200).send("https://bellapplab.xyz/adrock/" + bundleId + "/index.html");
	});
});

module.exports = router;