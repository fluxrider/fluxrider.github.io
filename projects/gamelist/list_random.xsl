<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">

	<div style="text-align:center;">
	<!-- Game List (in time) -->
	<xsl:for-each select="/gamelist/games/game">
	<!-- sort randomly -->
	<xsl:sort select="generate-id(.)"/>
	<!-- game id -->
	<xsl:variable name="game_id" select="id"/>
	<!-- row -->
	<div style="display:inline-block; margin: 5px;"><div style="display:table; text-align:center; border:1px solid; padding: 5px;"><div style="display:table-cell; vertical-align:middle;">
	<xsl:variable name="canvas_init">
	var canvas_<xsl:value-of select="$game_id"/> = document.getElementById("canvas_<xsl:value-of select="$game_id"/>");
	canvas_<xsl:value-of select="$game_id"/>.no_longer_needed = false;
	canvas_<xsl:value-of select="$game_id"/>.filenames = new Array();
	<xsl:for-each select="/gamelist/shots/shot[@game=$game_id]">
	canvas_<xsl:value-of select="$game_id"/>.filenames.push("images/<xsl:value-of select="$game_id"/>/<xsl:value-of select="@name"/>");
	</xsl:for-each>
	array_shuffle(canvas_<xsl:value-of select="$game_id"/>.filenames);
	canvas_<xsl:value-of select="$game_id"/>.imageIndex = 0;
	canvas_<xsl:value-of select="$game_id"/>.link = document.getElementById("canvas_link_<xsl:value-of select="$game_id"/>");
	setTimeout(function(){ tickCanvas(canvas_<xsl:value-of select="$game_id"/>); }, SHORT_TICK_DELAY);
	</xsl:variable>
  <xsl:choose>
   <xsl:when test="/gamelist/shots/shot[@game=$game_id]"><a id="canvas_link_{$game_id}"><canvas id="canvas_{$game_id}" width="389" height="240" onload="{$canvas_init}"/></a><br/></xsl:when>
   <xsl:otherwise></xsl:otherwise>
	</xsl:choose>
	 <xsl:if test="favorite"><img width="16" height="16" alt="Favorite" src="favorite.png"/>&#160;</xsl:if><xsl:if test="core"><img width="16" height="16" alt="Core" src="core.png"/>&#160;</xsl:if><xsl:if test="timeless"><img width="16" height="16" alt="Timeless" src="timeless.png"/>&#160;</xsl:if><xsl:choose>
	  <xsl:when test="link != ''"><a href="{link}"><xsl:value-of select="title"/></a></xsl:when>
	  <xsl:otherwise><xsl:value-of select="title"/></xsl:otherwise>
	 </xsl:choose><xsl:if test="buggy">&#160;<img width="16" height="16" alt="Buggy Mess" src="bug.png"/></xsl:if><br/>
	 <xsl:value-of select="platform"/><br/>
     <xsl:if test="yearText != ''"><xsl:value-of select="yearText"/></xsl:if><xsl:if test="not(yearText  != '')"><xsl:value-of select="year"/></xsl:if><br/>
	 <xsl:value-of select="company"/>
  </div></div></div>
	</xsl:for-each>
	</div>
	
</xsl:template>
</xsl:stylesheet>
