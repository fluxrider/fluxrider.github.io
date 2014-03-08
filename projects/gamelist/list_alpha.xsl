<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">

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
	<xsl:sort select="title" order="ascending"/>
	<!-- game id -->
	<xsl:variable name="game_id" select="id"/>
	<!-- row -->
	<tr>
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
