# PCO Podman deployment

This document describes the deployment of the PCO software in a Podman environment. Be aware that this is a manual process and that the deployment is not automated.
So prepare yourself by taking a coffee and follow the steps carefully.

# Prepare VM

https://devcloud.tgwdev.internal/

Provisioning --> Catalog --> Oracle Linux 8 Podman

Select Group --> Instance Label with 8 Characters G003PCOPODMN01

ORDER NOW

Take a coffee. This will take some time!

Release Notes for the template can be found here:

https://confluence.tgw-group.com/display/TMxITSMSWKB/Release+Notes+Podman+Container+Runtime

The default password can be found there as well.

## Disable HAProxy

WERX is using Oauth.Gateway as a reverse proxy and for authentication. Therefore, HAProxy is not needed and needs to be disabled.

```bash
sudo systemctl stop haproxy
sudo systemctl disable haproxy
```

## Available Ports in DevCloud 2.0

22, 80, 443, 8080

## Configure Podman

Netavark as DNS resolver which works better with Podman

Install it with:

```bash
sudo dnf install netavark
```

```bash
sudo nano /etc/containers/containers.conf
--

[network]

# Explicitly use netavark. See https://github.com/containers/podman-compose/issues/455
network_backend = "netavark"

--

podman system reset --force
```

## Firewalld

Oracle Linux 8 comes with firewalld. You need to open the ports for the services.

```bash
sudo firewall-cmd --add-port=443/tcp
sudo firewall-cmd --add-port=8080/tcp
```

Check the ports with:

```bash 
sudo firewall-cmd --list-all
```

## Switch to podman user

Podman containers are run as the podman user to avoid running containers as root or as tgw user.
To switch to the podman user, execute the following command:

```bash
sudo -iu podman
```

## Request a authentication token

Contact uiux-support@tgw-group.com to get an access token to the TGW Container repository

Container registry access token login

```bash
podman login -u USER -p PASSWORD tgwsoftwarecontainerregistry.azurecr.io
```

## Install Git

```bash
sudo dnf install git
```

## Allow priviledged ports

To allow the usage of priviledged ports without root permissions, you need to execute the following command:

```bash
sudo sysctl net.ipv4.ip_unprivileged_port_start=80
```

# Configure Keycloak

Terraform is a tool for infrastructure as code. You can also use it to create and configure a REALM on Keycloak (SAS)

In the folder sas/config configure the file terraform.tfvars

1. Make terraform executable

```bash
chmod +x terraform
```

2. Install the Keycloak Terraform provider with `./terraform init`
3. Configure your Keycloak instance in `terraform.tfvars`. Examples are provided in the file.
4. Run `./terraform plan -var-file="terraform.tfvars"` to see what will be created
5. Run `./terraform apply -var-file="terraform.tfvars"` to create the resources
6. Run `./terraform destroy -var-file="terraform.tfvars"` to remove the resources from the Keycloak instance, if desired

> If an error occurs during the execution just run the command again. It will continue from the last step.

> The client supports linux and can only be executed there. If you want to execute it from windows you need to execute the terrform.exe.

# Set Up Webapps

## Start the BFG Database

The BFG database is a PostgreSQL database. It is used to store Portal Backend data like dashboards and user profiles.
Navigate to the webapps/postgresbfg folder. Navigate to the webapps/postgresbfg folder first.

Copy webapps/postgresbfg/postgresbfg.yaml to the folder /home/podman/kube/

```bash
cp webapps/postgresbfg/postgresbfg.yaml /home/podman/kube/
```

Copy the file  webapps/postgresbfg/setupPostgresBfg.sh to the folder /home/podman/scripts/

```bash
cp webapps/postgresbfg/setupPostgresBfg.sh /home/podman/scripts/
```

## Start the BFG

The BFG is a .NET Webapi based Backend application for the portal.

Copy webapps/bfg/bfg.yaml to the folder /home/podman/kube/

```bash
cp webapps/bfg/bfg.yaml /home/podman/kube/
```

Copy the file  webapps/bfg/setupBfg.sh to the folder /home/podman/scripts/

```bash
cp webapps/bfg/setupBfg.sh /home/podman/scripts/
```

## Start the Portal Frontend

The Portal is a Webapp in a NGINX container.

Copy webapps/portal/portal.yaml to the folder /home/podman/kube/

```bash
cp webapps/portal/portal.yaml /home/podman/kube/
```

Copy the file  webapps/portal/setupPortal.sh to the folder /home/podman/scripts/

```bash
cp webapps/portal/setupPortal.sh /home/podman/scripts/
```

## Start the OAuth.Gateway

The OAuth Gateway is configured in the appsettings.json file. Navigate to the webapps/gateway/conf folder and configure it.

In order to be able to use the newest version of Oauth.Gateway, you need to trust the self signed CA ssl certificate.

To do this, you need to execute the following commands:

```bash
sudo trust anchor /path/to/G003PCOPODMN01CA.crt
```

Verify the certificate with:

```bash
trust list
```

Configure the appsettings.json file and start the OAuth Gateway.

As with the other services, copy the gateway.yaml file to the /home/podman/kube/ folder.

```bash
cp webapps/gateway/gateway.yaml /home/podman/kube/
```

Copy the file  webapps/gateway/setupGateway.sh to the folder /home/podman/scripts/

```bash
cp webapps/gateway/setupGateway.sh /home/podman/scripts/
```

## Fluentd for logging

Fluentd is a log collector daemon that allows you to collect logs from your frontend applications and forward them to a centralized logging server.

In contrast to the other services, Fluentd also needs the fluentd.conf file. Copy the file to the /home/podman/conf/ folder.

```bash
cp webapps/fluentd/fluentd.conf /home/podman/conf/
```

## PCO Frontend

The PCO Frontend is a VUE application that is served by an Nginx server Container.

The approach is the same as with the other services.

# Test the portal

Terraform created a Testuser in the realm. You can use this user to login to the portal.

https://G003PCOPODMN01

Username: test
Password: test

# Configure the PCO App

The first time the app needs to be configured via App Management in the portal. This is currently a manual process. Ask uiux-support@tgw-group.com for help. 

# Troubleshooting

There is a app but I can not create a Dashboard. What is the problem?

There might be a problem due to a missing user. Just modify the user in the user settings. If that doesn't work, there needs to be a user created in swagger. Ask uiux-support@tgw-group.com for help.
