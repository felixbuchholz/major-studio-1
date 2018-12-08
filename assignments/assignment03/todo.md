# Until tomorrow

## Increase margins between sections

## H1
- Fix resizing the h1.icon
- Change dashboard headline according to selectedCountry

## MAP 
1. hover and 
2. onclick to dashboard 

## COMPARISON

-   While the relationship between access to clean fuels and poverty is quite obvious for countries where access to clean fuels is above 4 % of the population other factors might be more influential below this threshold. To understand if this value is a tipping point in development let’s look at countries that in the given timeframe started just above the the threshold: Burkina Faso, Kenya and Ghana.

- style the tooltip
- onclick to dashboard
- reduce the interaction for the direct comparison =
    - Mobile view
    - remove slider
    - remove radio buttons
    - allow replay
    - allow raise
    - changeAxis?
    - Current Year BOLD BIG next to the Interface

### SUB-Conclusion

### CONCLUSION

## SCROLL & MOVEMENT
- Animation?

## GHANA
-  and make the small graphs
  - -50% poverty +115% Access to clean fuels
  - efficiency 40 % // cookstove illustration
  - 5000 –220000 tonnes LPG
  - annual loss of 502,000 disability adjusted life-years


# Requires big restructuring: 
- Hover for the graphs (comparison within graph!)
- changeAxis?
- Hover Population, GDP, Region, etc. – only available after animation -> roll them in
- style the radio buttons. 
- Connect slider and map again.
  - setting during animation works! – Make it less present during that, and after the animation is finished, use the slider to filter by year. 

# bonus: 
- Deactivate button up / down when end of range

# style 
- CSS clean fuels acces is now a button!


# ~Try to solve that~ Needs big re-structuring

https://stackoverflow.com/questions/29292858/if-you-specify-a-data-method-the-second-argument-in-d3-js-existing-elements-are

``` javascript
function mousemove(d){
    console.log(this);
    d3.select(this).classed('deact', false)
    // Data – DOM does get out of sync. https://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
     .raise();
    tooltip.html(`${d[3]}`)
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 50) + "px");
}
``` 

You basically have to restructure the whole thing: 

Structure: 
First hierarchy level: – matches 'g'
Information: currentPosition, Country, Year
Second hierarchy level


## Done (only after 20181206)
- Make another y-Axis option to include countries under 4 % access //
- CSS toggle switch: SDG focus, plain
- Enable the map view
- Re-positioning
- Activate links
- Read & write about Ghana

## Decided against
- Show also the high and low, when hovering over a country
- Dashboard sorting 
- Use ISO-Code on backend instead of countryname // not for now :) // Would be better next time!
- On jumping to next country: compare two countries
- // .transition().duration(pointTimer)
  // .style('font-size', '12px')
  // .style('fill', 'rgb(0, 0, 0)')
- <!-- <div>2000</div><div>2016</div> -->
- ~Make the navigation vanish and the dashboard pop up in sequence~ !! //