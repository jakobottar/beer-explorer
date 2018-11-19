
import urllib.request
import urllib.parse
import json

key = ""

baseUrl = "https://maps.googleapis.com/maps/api/geocode/json?address="
keyString = "&key=" + key

# pump+house+brewery&

breweryFilePath = "data/byBrewery-noLocations.csv"
byBreweryNoLocationFile = open(breweryFilePath, 'r')
breweryData = byBreweryNoLocationFile.readlines()
byBreweryNoLocationFile.close()

for breweryIndex in range(1, len(breweryData[1:])):
  breweryName = breweryData[breweryIndex].split(",")[0].strip('"').replace(" ", "+")
  print(breweryName)
  url = baseUrl + breweryName + keyString
  try:
    f = urllib.request.urlopen(url)
    locationInfo = json.loads(f.read().decode('utf-8'))["results"][0]["geometry"]["location"]
    breweryData[breweryIndex] = breweryData[breweryIndex].strip("\n") + "," + '"' + str(locationInfo["lat"]) + '"'
    breweryData[breweryIndex] = breweryData[breweryIndex].strip("\n") + "," + '"' + str(locationInfo["lng"]) + '"' + "\n"
  except:
    breweryData[breweryIndex] = breweryData[breweryIndex].strip("\n") + ",NA,NA"
    breweryData[breweryIndex] = breweryData[breweryIndex].strip("\n") + ",NA,NA\n"

breweryData[0] = breweryData[0].strip("\n")+',"lat"'+',"lng"\n'
byBreweryLocationFile = open("data/byBrewery-Locations.csv", 'w')
byBreweryLocationFile.writelines(breweryData)
byBreweryLocationFile.close()




