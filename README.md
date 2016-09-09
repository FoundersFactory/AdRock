# AdRock

## Setting up

* As the `boss` user, disable the firewall and enable local connections on port 3000:

`sudo ufw disable && sudo ufw allow from 127.0.0.1 to 127.0.0.1 port 3000`

### [SSH](https://gitlab.com/help/ssh/README)

* Create an ssh key if needed:

`ssh-keygen -t rsa -C "apps@bellapplab.com"`
* Copy the key and add it to GitLab's _Deploy Keys_:

`cat ~/.ssh/id_gitlab_rsa.pub`
* When logging in as `node`, make sure `ssh-agent` is running and add the ssh key:

```
eval `ssh-agent -s` && ssh-add /home/node/.ssh/id_gitlab_rsa
```

### Getting code

* Cloning the repo if needed:

`git clone git@gitlab.com:AdRock/Server.git`
* Installing Forever:

`npm install forever -g`
* Pulling changes and running the app:

`cd Server && git pull && npm install --save && cd .. && \
NODE_ENV=production forever --minUptime 1000 --spinSleepTime 1000 start ./Server/forever.json`
* Updating (with ssh):

`eval `ssh-agent -s` && ssh-add /home/node/.ssh/id_gitlab_rsa && \
forever stopall && cd Server && git pull && npm install --save && cd .. && \
NODE_ENV=production forever --minUptime 1000 --spinSleepTime 1000 start ./Server/forever.json`

* **Don't forget to enable the firewall!!**

### Fixing Nginx

* Pass requests onto node by modifying nginx's config (run as `boss`):

`sudo nano /usr/local/nginx/conf/nginx.conf`
* Add (to the `location` we want):

```
	include             /home/node/Server/nginx.conf;
```
