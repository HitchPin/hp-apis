{ inputs, ...}: {
  imports = [
    inputs.devshell.flakeModule
  ];

  perSystem = { config, ... }: {
    devshells.default = {
      commands = [
        { package = config.packages.python; category = "Python"; }
        { package = config.packages.uv; category = "Python"; }
        { package = config.packages.ruff; category = "Python"; }
        { package = config.packages.mypy; category = "Python"; }
      ];
    };
  };
}