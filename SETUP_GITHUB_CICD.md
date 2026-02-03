# Remote Deployment Setup Guide (GitHub Actions)

This guide explains how to set up automatic deployment so you can deploy to your server simply by pushing to GitHub.

## 1. Prepare the Server

Connect to your server via SSH one last time to set up the repository.

```bash
# SSH into your server
ssh root@197.201.240.218

# Create the project directory
mkdir -p ~/agalid
cd ~/agalid

# Clone your repository (You will need to authenticate)
# If your repo is private, you might need to use a Personal Access Token (PAT) or SSH key
git clone https://github.com/YOUR_USERNAME/agalid.git .

# Verify git is working
git status
```

## 2. Configure GitHub Secrets

Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
Click **New repository secret** and add the following:

| Name | Value | Description |
|------|-------|-------------|
| `HOST` | `197.201.240.218` | Your server IP address |
| `USERNAME` | `root` | Your SSH username (usually root or ubuntu) |
| `SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY----- ...` | Your private SSH key (content of your .pem file or id_rsa) |
| `PROD_ENV_FILE` | *(Content of infra/production.env)* | Copy the **entire content** of your local `infra/production.env` file here. |

### How to get the SSH Key?
You likely have a private key file (e.g., `id_rsa` or `agalid-key.pem`) on your local machine that you use to connect to the server. Open that file with a text editor and copy the entire content.

## 3. Deploy!

Now, whenever you push code to the `main` branch, GitHub Actions will:
1.  Run tests and checks.
2.  SSH into your server.
3.  Pull the latest code.
4.  Update the `.env` file with your secrets.
5.  Run the deployment script (`infra/deploy.sh`) to rebuild and restart Docker containers.

You can monitor the progress in the **Actions** tab on GitHub.

## Troubleshooting

-   **Permission Denied (publickey):** Check that the `SSH_KEY` secret is correct and corresponds to the public key in `~/.ssh/authorized_keys` on the server.
-   **Git Pull Failed:** If the server asks for a password during `git pull`, you need to configure git credential helper or use an SSH deploy key for GitHub.
    -   *Recommended:* Use an SSH Deploy Key on the server for GitHub access.
