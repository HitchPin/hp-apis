{
  perSystem = { pkgs, buildDotnetGlobalTool, lib, ... }: {
    packages.dotnet_9 = pkgs.dotnetCorePackages.dotnet_9.sdk;
    packages.dotnet-coverage = pkgs.buildDotnetGlobalTool {
      pname = "dotnet-coverage";
      version = "17.13.1";

      nugetHash = "sha256-dAkzNlDprnzxoYetM1lgljXhr00Mf8ZyDHdnv1YAAkY=";
      dotnet-runtime = pkgs.dotnetCorePackages.dotnet_9.runtime;
    };
    packages.dotnet-reportgenerator = pkgs.buildDotnetGlobalTool {
      pname = "reportgenerator";
      nugetName = "dotnet-reportgenerator-globaltool";
      version = "5.4.3";

      nugetHash = "sha256-EofgCOMUovzWtu2S5TJocMw/lkqu4E9ZCEZQEHS3JPE=";
      dotnet-runtime = pkgs.dotnetCorePackages.dotnet_9.runtime;
    };
  };
}