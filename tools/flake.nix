{
  description = "Description for the project";

  inputs = {
    nixpkgs.url = "nixpkgs";

    flake-parts = {
      url = "github:hercules-ci/flake-parts";
      inputs.nixpkgs-lib.follows = "nixpkgs";
    };

    devshell = {
      url = "github:numtide/devshell";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  
  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [
        ./.nix-modules/cli-packages.nix
        ./.nix-modules/cli-devshell.nix
        ./.nix-modules/docker-packages.nix
        ./.nix-modules/docker-devshell.nix
        ./.nix-modules/dotnet-packages.nix
        ./.nix-modules/dotnet-devshell.nix
        ./.nix-modules/nodejs-packages.nix
        ./.nix-modules/nodejs-devshell.nix
        ./.nix-modules/python-packages.nix
        ./.nix-modules/python-devshell.nix
      ];
      systems = [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" "x86_64-darwin" ];
      perSystem = { config, self', inputs', pkgs, system, ... }: {
        packages.default = pkgs.hello;
      };
      flake = {
      };
    };
}
