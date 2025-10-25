# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
  ];
  # Sets environment variables in the workspace
  env = {};
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "dbaeumer.vscode-eslint"
    ];
    # Enable previews
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["sh" "-c" "cd app-admin-supremo && npm run dev -- --port $PORT"];
          manager = "web";
        };
      };
    };
    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        npm-install = "cd app-admin-supremo && npm install";
      };
      # Runs when the workspace is (re)started
      onStart = {
        dev-server = "cd app-admin-supremo && npm run dev";
      };
    };
  };
}
