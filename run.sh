while getopts s:m:p: option
do
 case "${option}"
 in
	 m) MAP_BOX=${OPTARG};;
 esac
done

METEOR_SETTINGS=`cat settings.json`

export METEOR_SETTINGS; meteor --settings settings.json
