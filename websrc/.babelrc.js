module.exports = {
  plugins: [
    ["import", 
    {  
      "libraryName": "antd",  
      "style": false  
    }],
    [
      'babel-plugin-module-resolver',
      {
        alias: {
          components: './src/components',
        },
      },
    ],
  ],
};