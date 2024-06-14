Main idea about project is to provide seemless user experience, we developed this model so that it can be accessed in offline.

# Progressive Web App (PWA):

-> PWAs leverage modern web technologies to provide a seamless and engaging user experience, regardless of the user's device or network conditions. 

-> Offline capability is one of benefits of PWA's

# Service Worker:

-> Service workers are essential for enabling Progressive Web Apps (PWAs) to work offline and provide a more reliable user experience.

-> Service worker is a script that runs in the background, separate from your web page, and has no direct access to the DOM. It can intercept network requests, cache or retrieve resources from the cache, and deliver push notifications, among other capabilities.

# 3D-model
Rendering 3d-model using Three.js library and making the model to work in offline after initial load.

# Steps to run
1. Run npm install after cloning
2. Run npm start to start the server.
3. It provides links and choose "http://127.0.0.1:8080/" as it is considered as secured connection for localhosts. Service Worker caching will work only in secured connections.
4. Navigate to http://127.0.0.1:8080/index to see the 3D-Model