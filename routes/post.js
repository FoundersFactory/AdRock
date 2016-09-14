const router = require("express").Router(); 
const fs = require("fs");
const sanitiser = require("./sanitiser.js");
const multer = require("multer");
const remove = require("remove");
const plist = require("plist");
const moment = require("moment");
const dotenv = require("dotenv");

const upload = multer(multer({ 
	dest: "./tmp",
	limits: {
		fileSize: 1024 * 1024 * 512
	},
	fileFilter: function(req, file, cb) {
		try {
			let extension = file.originalname.split(".").pop().toLowerCase();
			if (extension.indexOf("ipa") !== -1 ||
				extension.indexOf("png") !== -1 || 
				extension.indexOf("apk") !== -1)
			{
				cb(null, true);
			} else {
				cb(null, false);
			}
		} catch (e) {
			console.log("Multer file filter error: " + e);
			cb(null, false);
		}
	}
}));

//Uploading apps
router.post("/", upload.fields([{ name: "app", maxCount: 1 }, { name: "icon", maxCount: 1 }]), function(req, res) 
{		
	if (req.files == null || req.files.length == 0) {
		res.status(406).send("Where are the files?");
		return;
	}
	
	let appFile = null;
	let iconFile = null;
	let extension = null;
		
	try {
		appFile = req.files["app"][0];
		extension = appFile.originalname.toLowerCase().split(".").pop();
	} catch (e) {
		console.log("ERROR: post(/adrock/upload) + getting files -> " + e);
	}
	
	try {
		iconFile = req.files["icon"][0];
	} catch (e) {
		console.log("WARNING: post(/adrock/upload) + no icon -> " + e);
	}
	
	let erase = function() {
		try {
			let paths = [];
			if (appFile) paths.push(appFile.path);
			if (iconFile) paths.push(iconFile.path); 
			remove.removeSync(paths, { ignoreErrors: true, ignoreMissing: true });
		} catch (e) {
			console.log("ERROR: post(/adrock/upload) + removeSync -> " + e);
		}
	}
	
	let error = function(message) {
		erase();
		res.status(406).send(message);
	}
	
	if (appFile == null) {
		error("Where is the app?!");
		return;
	}
	
	if (extension == null || extension.length == 0) {
		error("Where is the app's extension?!");
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
		    bundleId = req.body["bundleId"].split(" ").join("");
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
		
		dotenv.load();
		
		let rootPath = sanitiser.rootPath + "/" + bundleId.toLowerCase();
		let externalRootPath = process.env.EXTERNAL_URL + "/adrock/" + bundleId.toLowerCase();
		let platformPath = null;
		if (extension === "ipa") {
			platformPath = rootPath + "/" + "ios";
			externalRootPath += "/" + "ios";
		} else {
			platformPath = rootPath + "/" + "android";
			externalRootPath += "/" + "android";
		}
		let indexPath = platformPath + "/index.html";
		let folderPath = platformPath + "/v" + version;
		let appPath = folderPath + "/app." + extension;
		let iconPath = platformPath + "/icon.png";
		
		try {
			//If we already have a folder named after the app's Bundle ID, we delete its index.html file
			remove.removeSync(indexPath, { ignoreErrors: true, ignoreMissing: true });
		} catch (e) {
			console.log("ERROR: post(/adrock/upload) + deleting index.html -> " + e);
		}
		try {
			//If we already have a version, we shall replace it
			remove.removeSync(folderPath, { ignoreErrors: true, ignoreMissing: true });
		} catch (e) {
			console.log("ERROR: post(/adrock/upload) + deleting version -> " + e);
		}
		try {
			//If we already have an icon, we shall replace it, but only if another one has been uploaded
			if (iconFile) {
				remove.removeSync(iconPath, { ignoreErrors: true, ignoreMissing: true });
			}
		} catch (e) {
			console.log("ERROR: post(/adrock/upload) + deleting icon -> " + e);
		}
		
		//Creating folders if needed
		try {
			fs.mkdirSync(sanitiser.rootPath);
		} catch (e) {
			console.log("WARNING: post(/adrock/upload) + creating apps folder -> " + e);
		}
		try {
			fs.mkdirSync(rootPath);
		} catch (e) {
			console.log("WARNING: post(/adrock/upload) + creating root folder -> " + e);
		}
		try {
			fs.mkdirSync(platformPath);
		} catch (e) {
			console.log("WARNING: post(/adrock/upload) + creating platform folder -> " + e);
		}
		try {
			fs.mkdirSync(folderPath);
		} catch (e) {
			console.log("WARNING: post(/adrock/upload) + creating version folder -> " + e);
		}
		
		try {
			//Now we save the app
			fs.renameSync(appFile.path, appPath);
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
		if (extension === "ipa") {
			try {
				let manifest = fs.readFileSync("./templates/manifest.plist", "utf8");
				manifest = manifest.replace("{IPA}", externalRootPath + "/v" + version + "/app." + extension)
									.replace("{ICON}", externalRootPath + "/icon.png")
									.replace("{ICON}", externalRootPath + "/icon.png")
									.replace("{BUNDLE_ID}", bundleId)
									.replace("{VERSION}", version)
									.replace("{NAME}", name);
				fs.writeFileSync(folderPath + "/" + "manifest.plist", manifest);
			} catch (e) {
				console.log("ERROR: post(/adrock/upload) + fixing the manifest -> " + e);
				error("Oops... Something went wrong with the manifest file...");
				return;
			}
		}
		
		//Then we fix the HTML
		try {
			let main = fs.readFileSync("./templates/main.html", "utf8");
			let listTemplate = null;
			if (extension === "apk") {
				listTemplate = fs.readFileSync("./templates/android_list.html", "utf8");
			} else {
				listTemplate = fs.readFileSync("./templates/ios_list.html", "utf8");
			}
			let list = "";
			let elements = fs.readdirSync(rootPath);
			for (let i=0; i<elements.length; i++) {
				let element = elements[i];
				if (element.indexOf("v") !== -1) {
					list += listTemplate.replace("{URL}", process.env.EXTERNAL_URL)
										.replace("{BUNDLE_ID}", bundleId)
										.replace("{VERSION}", version)
										.replace("{VERSION}", version)
										.replace("{NAME}", name)
										.replace("{DATE}", moment().format("DD/MM/YYYY"));
				}
			}
			main = main.replace("{VERSIONS}", list);
			fs.writeFileSync(platformPath + "/index.html", main);
		} catch (e) {
			console.log("ERROR: post(/adrock/upload) + fixing index.html -> " + e);
			error("Oops... Something went wrong with the index.html file...");
			return;
		}
		
		//TODO: get bitly URL
		
		//GREAT SUCCESS
		erase();
		res.status(200).send(externalRootPath + "/index.html");
	});
});

module.exports = router;