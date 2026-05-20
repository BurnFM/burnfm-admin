# Burn Admin
#### The admin panel that allows you to manage content for [burnfm.com](https://burnfm.com).

This project is designed to work hand-in-hand with the Burn FM API: [api.burnfm.com](https://api.burnfm.com).

## Getting started

### Prerequisites

You'll need [node.js](https://nodejs.org/en/download) installed on your computer for this to run. 

For ease of setup, download and install the prebuilt option for your OS (instead of using the command line 
commands as they first suggest).

### 1. Install required node modules

All node.js projects have a package.json file which indicates what node libraries are required in the project.
First, you will need to download these via:

```bash 
npm install
```

### 2. Create .env and add secret

In its current form, this admin panel has no authentication system (the user is always logged in).
To prevent unauthorised changes to Burn FM's database / file system, you need to add the Burn FM's API secret variable
to the project's environment variables.

Duplicate [.env.example](.env.example), under the name `.env` and replace the default value with the API's actual secret.

> [!IMPORTANT]
> Talk to Burn FM's head of technology if you need the secret but don't have access to it.

> [!CAUTION]
> Never add the .env file to git as it is supposed to be kept a secret.


### 3. Run development server

Then, run the development server with:

```bash 
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


### 4. Editing and see changes in real-time with Fast Refresh

You can start editing any page by modifying its respective page.tsx file.
The page will auto-update as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!