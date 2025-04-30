{
  pkgs ? import <nixpkgs> {},
  # Use npm to install the required packages
  npmPackages = pkgs.npmPackages.withPackages (p: [
    p.puppeteer
    p.whatsappweb.js
  ]),
  # Use chromium for the browser
  chromium = pkgs.chromium,
  # Set up the dependencies
  dependencies = [
    npmPackages
    chromium
  ],
  # Define the environment
  environment = {
    # Configure the environment to use chromium and npm
    # This assumes you're using a REPL environment where
    # you have access to the $PATH variable
    PATH = pkgs.lib.makePath [ pkgs.nodePackages.bin pkgs.npmPackages.bin $PATH ]
  }
}