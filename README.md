Perform Feedback App Server
===========================

This runs a server which the mobile app communicates with.

Setup
-----

## Git

Install Git:

	sudo yum install git
	
Checkout this repository

## Docker

Install Docker and Docker Compose:

    yum install docker docker-compose
    
If you have multiple drives it's a good idea to store the docker volumes on the biggest drive:

    mv /var/lib/docker /home/template-user
    ln -s /home/template-user/docker /var/lib/docker
    
Now start docker:
    
    systemctl enable docker
    systemctl start docker
    
## NodeJS

Install NodeJS (TODO: Add a new docker container for node)

    sudo yum install nodejs
    
Get the required packages:

    npm install    
    
Install forever monitoring tool

    npm install forever -g

Start
-----

Create the config.local.js file on the config directory. Then Update the details.

    cp config/config.local.template.js config/config.local.js
    vim config/config.local.js

Start the app:

	sudo docker-compose up -d
    sudo bin/forever.sh

Database problem
----------------

On SELinux you may need to add the following policy to the Mongo data directory:

   chcon -Rt svirt_sandbox_file_t vol-mongo


