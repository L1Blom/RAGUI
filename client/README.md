# RAGUI: React user interface for RAG

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

See for project RAG [here](https://github.com/L1Blom/rag). This project is mandatory for all API-calls are based on functionality of this server.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

This is also run in build.sh which deploys also to a server, but you need to modify it for your use.

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

There are 3 pages:

- RAGUI
    This is the main window to interact with you documents in the context

- Context

    All the files that will be stored in the vector database

    Currently only .pdf and .txt files are supported

- Settings
    You can set a few things to experiment with your documents

| Topic | Value |
|-------|-----------|
|Project|set by RAG|
|Provider|set by RAG fi. **OPENAI**|
|Server API|[https://yourapi.com](https://yourapi.com)|
|Temperature|0.0 to 2.0|
|Max. results|1-10, limited by RAG too|
|Min. score|0.0 to 1.0|
|Chunk size|0 - 1000 step 10|
|Chunk overlap|0 to 100 step 5|
|No chunks|set by RAG as resultof splitting in chunks|
|Clear history| of the RAG|
|Reload documents|by the RAG|
|LLM| select f.i. **gpt-4o-mini**|
|Embedding| selet f.i.  **text-embedding-3-small**|

