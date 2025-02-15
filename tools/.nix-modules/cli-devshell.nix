{ inputs, ...}: {
  imports = [
    inputs.devshell.flakeModule
  ];

  perSystem = { config, ... }: {
    devshells.default = {
      packages = [
        "coreutils"
      ];
      commands = [
        { package = config.packages.aws; category = "CLI Tools"; }
        { package = config.packages.git; category = "CLI Tools"; }
        { package = config.packages.openssh; category = "CLI Tools"; }
      ];
    };
  };
}