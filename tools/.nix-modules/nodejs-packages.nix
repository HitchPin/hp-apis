{
  perSystem = { pkgs, ... }: {
    packages.nodejs = pkgs.nodejs_22;
    packages.pnpm = pkgs.pnpm;
    packages.aws-cdk = pkgs.nodePackages_latest.aws-cdk;
  };
}