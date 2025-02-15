{
  perSystem = { pkgs, ... }: {
    packages.python = pkgs.python313;
    packages.uv = pkgs.uv;
    packages.mypy = pkgs.mypy;
    packages.ruff = pkgs.ruff;
  };
}