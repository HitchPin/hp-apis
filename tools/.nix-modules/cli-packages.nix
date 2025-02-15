{
  perSystem = { pkgs, ... }: {
    packages.aws = pkgs.awscli2;
    packages.git = pkgs.git;
    packages.openssh = pkgs.openssh;
    packages.coreutils = pkgs.coreutils;
  };
}