{
  "plugins": [
    ["module-resolver", {
      "root": ["./creatures-backend"],
      "alias": {
        "test": "./test"
      }
    }]
  ],
  "presets": [
    [
      "env",
      {
        "targets": {
          "browsers": ["last 2 versions", "safari >= 7"]
        }
      }
    ]
  ]
}