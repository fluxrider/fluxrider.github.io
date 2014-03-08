<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">

	<!-- Game List (in time) -->
	<table border="1" align="center" cellSpacing="0" cellPadding="5">
	<tr>
	 <th>Media</th>
	 <th>Title</th>
	 <th>Platform</th>
	 <th>Year</th>
	 <th>Company</th>
	</tr>
	<xsl:for-each select="/gamelist/games/game">
	<!-- sort on time and then alphabetically -->
	<xsl:sort select="year" order="descending"/>
	<xsl:sort select="title" order="ascending"/>
	<!-- game id -->
	<xsl:variable name="game_id" select="id"/>
	<!-- row -->
	<tr>
	<xsl:variable name="canvas_init">
	var canvas_<xsl:value-of select="$game_id"/> = document.getElementById("canvas_<xsl:value-of select="$game_id"/>");
	canvas_<xsl:value-of select="$game_id"/>.filenames = new Array();
	<xsl:for-each select="/gamelist/shots/shot[@game=$game_id]">
	canvas_<xsl:value-of select="$game_id"/>.filenames.push("images/<xsl:value-of select="$game_id"/>/<xsl:value-of select="@name"/>");
	</xsl:for-each>
	canvas_<xsl:value-of select="$game_id"/>.imageIndex = Math.floor((Math.random()*canvas_<xsl:value-of select="$game_id"/>.filenames.length));
	canvas_<xsl:value-of select="$game_id"/>.link = document.getElementById("canvas_link_<xsl:value-of select="$game_id"/>");
	setTimeout(function(){ tickCanvas(canvas_<xsl:value-of select="$game_id"/>); }, SHORT_TICK_DELAY);
	</xsl:variable>
	 <td><a id="canvas_link_{$game_id}"><canvas id="canvas_{$game_id}" width="162" height="100" style="border:1px solid #000000;" onload="{$canvas_init}"/></a></td>
	 <td><xsl:if test="favorite"><img width="16" height="16" alt="Favorite" src="favorite.png"/>&#160;</xsl:if><xsl:if test="core"><img width="16" height="16" alt="Core" src="core.png"/>&#160;</xsl:if><xsl:if test="timeless"><img width="16" height="16" alt="Timeless" src="timeless.png"/>&#160;</xsl:if><xsl:choose>
	  <xsl:when test="link != ''"><a href="{link}"><xsl:value-of select="title"/></a></xsl:when>
	  <xsl:otherwise><xsl:value-of select="title"/></xsl:otherwise>
	 </xsl:choose><xsl:if test="buggy">&#160;<img width="16" height="16" alt="Buggy Mess" src="bug.png"/></xsl:if></td>
	 <td><xsl:value-of select="platform"/></td>
     <xsl:if test="yearText != ''"><td><xsl:value-of select="yearText"/></td></xsl:if><xsl:if test="not(yearText  != '')"><td><xsl:value-of select="year"/></td></xsl:if>
	 <td><xsl:value-of select="company"/></td>
	</tr>
	</xsl:for-each>
	</table>
	
</xsl:template>
</xsl:stylesheet>
