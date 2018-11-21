import csv
import math
import json

def LoadBreweryReviewData(brewery_id):
  print("Loading Data for brewery: ", brewery_id)
  with open('data/breweries/' + str(brewery_id) + '.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0
    beers = {}
    for row in csv_reader:
        if line_count == 0:
          pass
        else:
          if row[11] in beers:
            review = {}
            review["time"] = float(row[2])
            review["overall"] = float(row[3])
            review["aroma"] = float(row[4])
            review["appearance"] = float(row[5])
            review["palate"] = float(row[7])
            review["taste"] = float(row[8])
            beers[row[11]]["reviews"].append(review)
          else:
            beerData = {}
            beerData["beer_id"] = row[11]
            beerData["beer_name"] = row[9]
            beerData["beer_abv"] = row[10]
            beerData["beer_style"] = row[6]
            beerData["reviews"] = []
            beers[row[11]] = beerData
        line_count += 1

    finalBeers = []
    for key in beers.keys():
      beers[key]["histogram"] = {}
      beers[key]["histogram"]["overall"] = [0,0,0,0,0]
      beers[key]["histogram"]["aroma"] = [0,0,0,0,0]
      beers[key]["histogram"]["appearance"] = [0,0,0,0,0]
      beers[key]["histogram"]["palate"] = [0,0,0,0,0]
      beers[key]["histogram"]["taste"] = [0,0,0,0,0]
      beers[key]["rev_totals"] = {}
      beers[key]["rev_totals"]["overall"] = 0
      beers[key]["rev_totals"]["aroma"] = 0
      beers[key]["rev_totals"]["appearance"] = 0
      beers[key]["rev_totals"]["palate"] = 0
      beers[key]["rev_totals"]["taste"] = 0
      beers[key]["n_reviews"] = 0
      for review in beers[key]["reviews"]:
        if review["overall"] >= 5:
          beers[key]["histogram"]["overall"][4]+=1
        else:
          beers[key]["histogram"]["overall"][math.floor(review["overall"])] += 1

        if review["aroma"] >= 5:
          beers[key]["histogram"]["aroma"][4]+=1
        else:
          beers[key]["histogram"]["aroma"][math.floor(review["aroma"])] += 1

        if review["appearance"] >= 5:
          beers[key]["histogram"]["appearance"][4]+=1
        else:
          beers[key]["histogram"]["appearance"][math.floor(review["appearance"])] += 1

        if review["palate"] >= 5:
          beers[key]["histogram"]["palate"][4]+=1
        else:
          beers[key]["histogram"]["palate"][math.floor(review["palate"])] += 1

        if review["taste"] >= 5:
          beers[key]["histogram"]["taste"][4]+=1
        else:
          beers[key]["histogram"]["taste"][math.floor(review["taste"])] += 1

        beers[key]["rev_totals"]["overall"] += review["overall"]
        beers[key]["rev_totals"]["aroma"] += review["aroma"]
        beers[key]["rev_totals"]["appearance"] += review["appearance"]
        beers[key]["rev_totals"]["palate"] += review["palate"]
        beers[key]["rev_totals"]["taste"] += review["taste"]

      beers[key]["n_reviews"] = len(beers[key]["reviews"])
      beers[key]["averages"] = {}
      if beers[key]["n_reviews"] == 0:
        beers[key]["averages"]["overall"]  = 0
        beers[key]["averages"]["aroma"] = 0
        beers[key]["averages"]["appearance"] = 0
        beers[key]["averages"]["palate"] = 0
        beers[key]["averages"]["taste"]   = 0
      else:
        beers[key]["averages"]["overall"] = beers[key]["rev_totals"]["overall"]/beers[key]["n_reviews"]
        beers[key]["averages"]["aroma"] = beers[key]["rev_totals"]["aroma"]/beers[key]["n_reviews"]
        beers[key]["averages"]["appearance"] = beers[key]["rev_totals"]["appearance"]/beers[key]["n_reviews"]
        beers[key]["averages"]["palate"] = beers[key]["rev_totals"]["palate"]/beers[key]["n_reviews"]
        beers[key]["averages"]["taste"] = beers[key]["rev_totals"]["taste"]/beers[key]["n_reviews"]
      del beers[key]["reviews"]
      del beers[key]["rev_totals"]
      finalBeers.append(beers[key])
    return finalBeers

with open('data/byBrewery-locations.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0
    breweries = []
    for row in csv_reader:
        if line_count == 0:
          pass
          # print(f'Column names are {", ".join(row)}')
        # elif line_count == 10:
        #   break;
        else:
          breweryData = {}
          breweryData["brewery_name"] = row[0]
          breweryData["brewery_id"] = row[1]
          breweryData["lat"] = row[11]
          breweryData["lng"] = row[12]
          breweryData["beers"] = LoadBreweryReviewData(breweryData["brewery_id"])
          breweryData["histogram"] = {}
          breweryData["histogram"]["overall"] = [0,0,0,0,0]
          breweryData["histogram"]["aroma"] = [0,0,0,0,0]
          breweryData["histogram"]["appearance"] = [0,0,0,0,0]
          breweryData["histogram"]["palate"] = [0,0,0,0,0]
          breweryData["histogram"]["taste"] = [0,0,0,0,0]
          breweryData["n_reviews"] = 0

          breweryData["rev_totals"] = {}
          breweryData["rev_totals"]["overall"] = 0
          breweryData["rev_totals"]["aroma"] = 0
          breweryData["rev_totals"]["appearance"] = 0
          breweryData["rev_totals"]["palate"] = 0
          breweryData["rev_totals"]["taste"] = 0

          for beer in breweryData["beers"]:
            for value in range(0, len(beer["histogram"]["overall"])):
              breweryData["histogram"]["overall"][value] += beer["histogram"]["overall"][value]

            for value in range(0, len(beer["histogram"]["aroma"])):
              breweryData["histogram"]["aroma"][value] += beer["histogram"]["aroma"][value]

            for value in range(0, len(beer["histogram"]["appearance"])):
              breweryData["histogram"]["appearance"][value] += beer["histogram"]["appearance"][value]

            for value in range(0, len(beer["histogram"]["palate"])):
              breweryData["histogram"]["palate"][value] += beer["histogram"]["palate"][value]

            for value in range(0, len(beer["histogram"]["taste"])):
              breweryData["histogram"]["taste"][value] += beer["histogram"]["taste"][value]

            breweryData["rev_totals"]["overall"] += beer["averages"]["overall"] * beer["n_reviews"]
            breweryData["rev_totals"]["aroma"] += beer["averages"]["aroma"] * beer["n_reviews"]
            breweryData["rev_totals"]["appearance"] += beer["averages"]["appearance"] * beer["n_reviews"]
            breweryData["rev_totals"]["palate"] += beer["averages"]["palate"] * beer["n_reviews"]
            breweryData["rev_totals"]["taste"] += beer["averages"]["taste"] * beer["n_reviews"]
            breweryData["n_reviews"] += beer["n_reviews"]
          
          breweryData["averages"] = {}
          if breweryData["n_reviews"] == 0:
            breweryData["averages"]["overall"] = 0
            breweryData["averages"]["aroma"] = 0
            breweryData["averages"]["appearance"] = 0
            breweryData["averages"]["palate"] = 0
            breweryData["averages"]["taste"] = 0
          else:
            breweryData["averages"]["overall"] = breweryData["rev_totals"]["overall"] / breweryData["n_reviews"]
            breweryData["averages"]["aroma"] = breweryData["rev_totals"]["aroma"] / breweryData["n_reviews"]
            breweryData["averages"]["appearance"] = breweryData["rev_totals"]["appearance"] / breweryData["n_reviews"]
            breweryData["averages"]["palate"] = breweryData["rev_totals"]["palate"] / breweryData["n_reviews"]
            breweryData["averages"]["taste"] = breweryData["rev_totals"]["taste"] / breweryData["n_reviews"]
          del breweryData["rev_totals"]
          breweries.append(breweryData)
        line_count += 1

breweryJson = json.dumps(breweries)
outputFile = open("data/processed_data.json", 'w')
outputFile.write(breweryJson)
outputFile.close()