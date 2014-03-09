<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
	<p class="small" align="center">
	Total (<xsl:value-of select="count(/gamelist/games/game)"/>)<br/>
	<a style="cursor:pointer" onclick="displayXSLT('list_in_time.xsl', 'gamelist'); init_canvases();">In Time</a>&#160;|&#160;
	<a style="cursor:pointer" onclick="displayXSLT('list_alpha.xsl', 'gamelist'); init_canvases();">Alphabetic</a>&#160;|&#160;
	<a style="cursor:pointer" onclick="displayXSLT('list_by_platform_in_time.xsl', 'gamelist'); init_canvases();">By Platform in Time</a>&#160;|&#160;
	<a style="cursor:pointer" onclick="displayXSLT('list_by_platform_alpha.xsl', 'gamelist'); init_canvases();">By Platform and Alphabetic</a>
        </p>
	<p class="small" align="center">
        Legend<br/>
	<a style="cursor:pointer" onclick="displayXSLT('list_in_time_core.xsl', 'gamelist'); init_canvases();">Core Influence</a> <img width="16" height="16" alt="Core Influence" src="core.png"/>(<xsl:value-of select="count(/gamelist/games/game/core)"/>)&#160;|&#160;
	<a style="cursor:pointer" onclick="displayXSLT('list_in_time_timeless.xsl', 'gamelist'); init_canvases();">Timeless Gameplay</a> <img width="16" height="16" alt="Timeless" src="timeless.png"/>(<xsl:value-of select="count(/gamelist/games/game/timeless)"/>)&#160;|&#160;
	<a style="cursor:pointer" onclick="displayXSLT('list_in_time_bugs.xsl', 'gamelist'); init_canvases();">Bug-Ridden</a> <img width="16" height="16" alt="Buggy Mess" src="bug.png"/>(<xsl:value-of select="count(/gamelist/games/game/buggy)"/>)
	</p>
</xsl:template>
</xsl:stylesheet>
