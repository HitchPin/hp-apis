{
  description = "Hello World in .NET";
  inputs = {
    nixpkgs.url = "nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = {
    nixpkgs,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {inherit system;};
      in {
        devShells = {
          default = pkgs.mkShell {
            buildInputs = [
              pkgs.awscli2
              pkgs.kubectl
            ];
          };
        };
      }
    );
}