find images -name "*.png" |
{
	while read f
	do
	  mv -v "$f" `echo "$f" | tr '[A-Z \(\)\[\]\!]' '[a-z______]'`
	done
}

find images -name "*.png" |
{
	while read f
	do
	  mv -v "$f" "${f/]/}"
	done
}

find images -name "*.jpg" |
{
	while read f
	do
	  mv -v "$f" `echo "$f" | tr '[A-Z \(\)\[\]\!]' '[a-z______]'`
	done
}

find images -name "*.jpg" |
{
	while read f
	do
	  mv -v "$f" "${f/]/}"
	done
}

#find images -name "*.png" | awk -F/ '{print "<shot game=\"" $2 "\" name=\"" $3 "\"/>"}'
#find images -name "*.jpg" | awk -F/ '{print "<shot game=\"" $2 "\" name=\"" $3 "\"/>"}'
