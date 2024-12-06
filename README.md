# Repository Template

[![Netlify Status](https://api.netlify.com/api/v1/badges/c440c335-5dc7-4195-98a0-5363ee86a824/deploy-status)](https://app.netlify.com/sites/nimble-starlight-cd143d/deploys)

# Motivation and Concept
Those who are injured or in chronic pain may struggle to stay on track with physical therapy. Whether it is part of injury recovery, chronic pain management, or simply mobility improvement, physical therapy is crucial to help relieve pain, move better, and strengthen weakened muscles. Even when exercise is performed regularly, the difficulty of tracking pain and strength progress can discourage those on their physical therapy journey. VitalMotion is an application that simplifies tracking pain and physical therapy exercises to help users manage their discomfort while still achieving their recovery goals.


# CI/CD
Our CI/CD actions are done using github actions. They are available at .github/workflows. \
backendtest.yml and frontend.yml will run on pull requests to main, on any push, and can be manually triggered in the github action's tab by selecting the desired action and clicking 'Run workflow'. These actions are responsible for running our tests on our front and back end. \
backend_CD.yml is our github action for deploying our backend. It runs on pushes to main and can be manually triggered. \
Our front end CD is handled by netlify, and should automatically run on any push. One can manually trigger a deploy though the netlify website.

# Running Locally
## To set up to run locally follow the following steps: 
1) clone the repository 
2) go to the VitalMotion directory 
    1) make sure you have node installed and run npm i 
    2) set up a firebse project and create a credentials.js file. This file should export a credentials object 
    3) you will also need to replace all instances of `hassanrizvi14.pythonanywhere.com` with `localhost:8081` within files in VitalMotion
3) go to the backend folder
    1) make sure you have python installed. Then you can optionally create a virtual environment and activate it. Finally install our requirements.txt with pip.
    2) create an admin_credentials.json file with your firestore projects information 



2.2 credentials.js
```
export const credentials = {
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  "storageBucket": "...",
  "messagingSenderId": "...",
  "appId": "..."
}
```
3.2 admin_credentials.json
```
{
  "type": "...",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "...",
  "universe_domain": "..."
}
```


## to run locally
1) go to VitalMotion and run `npx expo start`
2) on a seperate terminal, go to backend and run `python app.py`
3) a local instance of the application should be available at localhost:8081
4) to close, make sure to close the programs on each of the terminals. 

## to run tests locally
1) to run frontend tests locally, go to VitalMotion and run `npm run test`
2) to run backend tests locally, go to backend and run `PYTHONPATH=. pytest` 


## to build locally
only the frontend needs to be built
1) go to VitalMotion and run `npx expo export --platform web`
2) you should now find a built version in /VitalMotion/dist/