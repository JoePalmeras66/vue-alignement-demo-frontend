# PCO Podman deployment

This document describes the deployment of the PCO software in a Podman environment. Be aware that this is a manual process and that the deployment is not automated.
So prepare yourself by taking a coffee and follow the steps carefully.

# Prepare VM

https://devcloud.tgwdev.internal/

Provisioning --> Catalog --> Oracle Linux 9 Podman

Select Group --> Instance Label with 8 Characters G003PCOPODMN01

ORDER NOW

Take a coffee. This will take some time!

Release Notes for the template can be found here:

https://confluence.tgw-group.com/display/TMxITSMSWKB/Release+Notes+Podman+Container+Runtime

The default password can be found there as well.

## Disable HAProxy

```bash
sudo systemctl stop haproxy
sudo systemctl disable haproxy
```

## Available Ports in DevCloud 2.0

22, 80, 443, 8080

## Configure Podman

Netavark as DNS resolver which works better with Podman

```bash
sudo nano /etc/containers/containers.conf
--

[network]

# Explicitly use netavark. See https://github.com/containers/podman-compose/issues/455
network_backend = "netavark"

--

podman system reset --force
sudo dnf install podman-compose
```

## Firewalld

Stop firewall

```bash
sudo systemctl stop firewalld
sudo systemctl disable firewalld
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

> The client supports linux and can only be executed there. If you want to execute it from windows you need to download the terrform.exe from terraform.io.

# Set Up Webapps

## Prepare Podman Network

Webapps are in a different network than the SAS. Create a new network for the webapps.

```bash
podman network create interConNet
```

## Start the BFG Database

The BFG database is a PostgreSQL database. It is used to store Portal Backend data like dashboards and user profiles.
Navigate to the webapps/postgresbfg folder. Navigate to the postgres folder first

```bash
podman-compose pull
```

When everything is pulled successful, start the containers with:

```bash
podman-compose up -d
```

The same database secret is used as for the SAS.

## Start the BFG

The following secrets are needed:

```bash
printf <secret> | podman secret create DATABASE_PASSWORD -
printf <secret> | podman secret create JWT_SECRET -
```

The JWT_SECRET is a secret used to sign JWT tokens. You can find it in the sas/keycloak terraform.tfvars in the field keycloak_client_secret.

Navigate to the webapps/bfg folder

```bash
podman-compose pull
podman-compose up -d
```

Configure the rest of the environment variables in the podman-compose.yaml file.

## Start the Portal Frontend

The Portal Frontend is configured in the podman-compose.yaml file. Navigate to the webapps/portal folder and configure it.

```bash
podman-compose pull
podman-compose up -d
```

## Start the OAuth.Gateway

The OAuth Gateway is configured in the appsettings.json file. Navigate to the webapps/oauth.gateway/conf folder and configure it.

In order to be able to use the newest version of Oauth.Gateway, you need to trust the self signed CA ssl certificate. To do this, you need to execute the following commands:

```bash
sudo trust anchor /path/to/G003PCOPODMN01CA.crt
```

Verify that the certificate is trusted with:

```bash
trust list
```

Configure the appsettings.json file and start the OAuth Gateway.

Configure the podman-compose.yaml file in the webapps/oauth.gateway folder and then run:

```bash
podman-compose pull
podman-compose up -d
```

If the host is not reachable, add the IP by adding the following line to the /etc/hosts file:

```bash
IP_ADDRESS HOSTNAME
```

## Fluentd for logging

Fluentd is a log collector daemon that allows you to collect logs from your frontend applications and forward them to a centralized logging server.

Navigate to the webapps/fluentd folder and start the container with:

```bash
podman-compose pull
podman-compose up -d
```

## PCO Frontend

The PCO Frontend is a VUE application that is served by an Nginx server Container. Configure the app in the podman-compose.yaml file.

Navigate to the webapps/pco-frontend folder and start the container with:

```bash
podman-compose pull
podman-compose up -d
```

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
