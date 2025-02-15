{ inputs, ...}: {
  imports = [
    inputs.devshell.flakeModule
  ];

  perSystem = { config, ... }: {
    devshells.default = {
      commands = [
        { package = config.packages.docker; category = "Docker"; }
      ];
    };
  };
}