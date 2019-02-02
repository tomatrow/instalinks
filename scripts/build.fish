#! /usr/local/bin/fish
# should just cat styles => minify => make a constant in js
# then join to instalinks

pushd ~/src/instalinks

# get thge text
cat src/styles.css | read -z styles_full
cat src/Instalinks.js | read -z script_full
echo $styles_full | uglifycss | read -z styles_mini
echo $script_full | minify | read -z script_mini

# create build directory if needed
if not test -e build
    mkdir build
end

# save it
function merge -a styles script
    echo -e "const INSTALINKS_STYLES = `$styles`\n"
    echo "$script"
end
merge "$styles_full" "$script_full" > build/instalinks.js
merge "$styles_mini" "$script_mini" > build/instalinks.min.js

popd
