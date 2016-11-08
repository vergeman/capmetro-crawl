module.exports = {

    apps : [

    // First application
    {
      name      : "app",
      script    : "app.js",
        env:  {
            NODE_PATH : '.',
            NODE_ENV: "dev"
        },
        env_production : {
            NODE_PATH : '.',
            NODE_ENV: "prod" }
    },

  ]
};
