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
        ./tools/.nix-modules/cli-packages.nix
        ./tools/.nix-modules/cli-devshell.nix
        ./tools/.nix-modules/docker-packages.nix
        ./tools/.nix-modules/docker-devshell.nix
        ./tools/.nix-modules/dotnet-packages.nix
        ./tools/.nix-modules/dotnet-devshell.nix
        ./tools/.nix-modules/nodejs-packages.nix
        ./tools/.nix-modules/nodejs-devshell.nix
        ./tools/.nix-modules/python-packages.nix
        ./tools/.nix-modules/python-devshell.nix
      ];
      systems = [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" "x86_64-darwin" ];
      perSystem = { config, self', inputs', pkgs, system, ... }: {
        packages.default = pkgs.hello;
      };
      flake = {
      };
    };
}
