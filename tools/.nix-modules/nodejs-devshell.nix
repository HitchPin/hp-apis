{ inputs, ...}: {
  imports = [
    inputs.devshell.flakeModule
  ];

  perSystem = { config, ... }: {
    devshells.default = {
      commands = [
        { package = config.packages.nodejs; category = "Node/JS"; }
        { package = config.packages.pnpm; category = "Node/JS"; }
        { package = config.packages.aws-cdk; category = "Node/JS"; }
      ];
      env = [
        {
          name = "JSII_SILENCE_WARNING_UNTESTED_NODE_VERSION";
          eval = "1";
        }
      ];
    };
  };
}