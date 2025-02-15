{ inputs, ...}: {
  imports = [
    inputs.devshell.flakeModule
  ];

  perSystem = { config, ... }: {
    devshells.default = {
      commands = [
        { package = config.packages.dotnet_9; category = "DotNet"; }
        { package = config.packages.dotnet-coverage; category = "DotNet"; }
        { package = config.packages.dotnet-reportgenerator; category = "DotNet"; }
      ];
    };
  };
}