{
  perSystem = { pkgs, ... }: {
    packages.docker = pkgs.docker;
    packages.docker-credential-helpers = pkgs.docker-credential-helpers;
  };
}