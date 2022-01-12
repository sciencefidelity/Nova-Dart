if [ "$(brew --version | grep -c "brew")" -lt 1 ]; then
  if [ "$(which flutter | grep -c 'not found')" -lt 1 ]; then
    if [ "$(which dart | grep -c 'not found')" -lt 1 ]; then
      echo "Flutter and Dart not found"
    else
      which dart
    fi
  else
    which flutter
  fi
else
  if [ "$(brew list --cask | grep -c flutter)" -lt 1 ]; then
    if [ "$(brew list --cask | grep -c dart)" -lt 1 ]; then
      if [ "$(which flutter | grep -c 'not found')" -lt 1 ]; then
        if [ "$(which dart | grep -c 'not found')" -lt 1 ]; then
          echo "Flutter and Dart not found"
        else
          which dart
        fi
      else
        which flutter
      fi
    else
      brew info dart | sed -n "3 p" | grep -o "^\S*"
    fi
  else
    brew info flutter | sed -n "3 p" | grep -o "^\S*"
  fi
fi
