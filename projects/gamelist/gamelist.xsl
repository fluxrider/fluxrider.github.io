<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
	<html>
	<head>
		<title>Great Games</title>
		<link rel="stylesheet" href="../../styles.css" type="text/css"/>
	</head>
	<body>
	<p class="title">Great Games</p>

	<!-- Statistics (count) -->
	<p align="center">
	Total number of games: <xsl:value-of select="count(/gamelist/games/game)"/><br/>
	<span class="halfOpaque">Number of exalted games: <xsl:value-of select="count(/gamelist/games/game/core)"/></span>
	</p>
	
	<!-- Game List (in time) -->
	<table border="1" align="center" cellSpacing="0" cellPadding="5">
	<tr>
	 <th>Title</th>
	 <th>Platform</th>
	 <th>Year</th>
	 <th>Company</th>
	</tr>
	<xsl:for-each select="/gamelist/games/game">
	<!-- sort on time and then alphabetically -->
	<xsl:sort select="year" order="descending"/>
	<xsl:sort select="title" order="ascending"/>
	<!-- Special color for exalted game -->
	<xsl:variable name="trStyle">
		<xsl:choose>
			<xsl:when test="core">
				<xsl:text>halfOpaque</xsl:text>
			</xsl:when>
			<xsl:otherwise>
				<xsl:text>dummy</xsl:text>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>
	<!-- row -->
	<tr class="{$trStyle}">
	 <xsl:choose>
	  <xsl:when test="link != ''"><td><a href="{link}"><xsl:value-of select="title"/></a></td></xsl:when>
	  <xsl:otherwise><td><xsl:value-of select="title"/></td></xsl:otherwise>
	 </xsl:choose>	
	 <td><xsl:value-of select="platform"/></td>
     <xsl:if test="yearText != ''"><td><xsl:value-of select="yearText"/></td></xsl:if><xsl:if test="not(yearText  != '')"><td><xsl:value-of select="year"/></td></xsl:if>
	 <td><xsl:value-of select="company"/></td>
	</tr>
	</xsl:for-each>
	</table>

	</body>
	</html>
</xsl:template>
</xsl:stylesheet>
