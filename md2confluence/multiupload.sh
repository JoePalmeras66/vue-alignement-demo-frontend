# For documentation please check https://dev.azure.com/TGW-Software/Markdown2Confluence
# this script is executed inside the mark container

echo "In multiupload"

echo "Markdown2Confluence version"
mark -v

# starting the container mounts the project specific docs location into /docs
cd /docs

echo "List files up front"
find -type f -name '*.md' | sort

echo "======================="
echo "Start upload"

FAILED_FILES=0

#files need to be sorted before upload - otherwise parents could be created in the wrong hierarchy
for file in $(find -type f -name '*.md' | sort ); do
        echo "| Sync $file";

        if mark -u $1 -p $2 -b $3 -f $file;
        then
                :
        else
                echo "  failed file $file"
                ((FAILED_FILES++))
                cat $file
        #exit 1
        fi

        echo;
done

if (( FAILED_FILES > 0))
then
        exit 25
fi