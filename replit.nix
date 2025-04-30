{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.chromium
    pkgs.libxcomposite
    pkgs.libxdamage
    pkgs.libnss
    pkgs.libxrandr
    pkgs.libx11
    pkgs.libxfixes
    pkgs.libxcb
    pkgs.glib
    pkgs.cups
    pkgs.freetype
    pkgs.fontconfig
  ];
}
