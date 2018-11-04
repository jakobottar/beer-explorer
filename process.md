# Basic Info

<!-- The project title, your names, e-mail addresses, UIDs, a link to the project repository. -->

Title: The best beer in the world!

Names: Jakob Johnson ( A01976871, Jakob.Johnson@usu.edu) and Derek Hunter(a01389046, derek.hunter@aggiemail.usu.edu), team `nullpointer`

[Repo Link](https://github.com/jakobottar/cs5890-final-project)

# Background and Motivation

<!-- Discuss your motivations and reasons for choosing this project, especially any background or research interests that may have influenced your decision. -->

In 2007, the Brewer's Association of America consisted of 422 breweries. In 2017, it had grown to nearly 4,000. As the taste of American beer drinkers diversified, simply asking for "a pint of your finest ale, please" was no longer sufficient. Instead, the new craft beer drinkers needed a way to quantify and track which beers they liked and didn't like. A number of beer rating sites sprang up, and BeerAdvocate rose to the top as the most popular.

# Project Objectives

<!-- Provide the primary questions you are trying to answer with your visualization. What would you like to learn and accomplish? List the benefits. -->

In this project, we want to improve upon the BeerAdvocate platform and better visualize the massive amount of data stored in sites like these. We want to better show the "best beers" in regions and styles, and explore how the rating distribution changes between beer styles.

# Data

<!-- From where and how are you collecting your data? If appropriate, provide a link to your data sources. -->

BeerAdvocate has no public API, but a dataset spanning 2001-2011 with more than 1.5 million reviews was [published on data.world](https://data.world/socialmediadata/beeradvocate).
The dataset consists of individual reviews, each with 13 attributes,

- `brewery_id`
- `brewery_name`
- `review_time`
- `review_overall`
- `review_aroma`
- `review_appearance`
- `review_palate`
- `review_taste`
- `review_profilename`
- `beer_style`
- `beer_name`
- `beer_abv`
- `beer_beerid`

We might also look at including data from RateBeer or Untappd, because they seem to be more open to public data use.

# Data Processing

<!-- Do you expect to do substantial data cleanup? What quantities do you plan to derive from your data? How will data processing be implemented? -->

Processing this massive amount of data will be a challenge. The dataset is fairly large, it had to be split into 4 different `.csv` files, each around 50 Mb to fit into GitHub. Together these take about 5 sec to simply read into a webpage.

We plan on removing data that are too small to be relevant or useful, such as beers with only one or very few reviews, as well as removing attributes that are not useful such as user IDs.

Another challenge the data will present is that of location. Since we are only provided with a brewery name, we will either have to manually collect data for the largest/best/most relevant breweries or build in some method of retrieving that data from Google Maps or something.

# Visualization Design

<!-- How will you display your data? Provide some general ideas that you have for the visualization design. Develop three alternative prototype designs for your visualization. Create one final design that incorporates the best of your three designs. Describe your designs and justify your choices of visual encodings. We recommend you use the Five Design Sheet Methodology -->

Because of our relatively limited data columns and very large number of rows we're faced with a couple of challenges for our visulization. We're mostly interested in inspecting our data by brewery, for example which breweries, on average, have the best beer. Below is an example table idea we had.

## Visualizing Brewery Information

![Example Table Vis](process_img/table_vis.jpg)

The basic idea is to do something similar to the world cup assignment, where each row in the table
represents a brewery, and data cells would be some visualization of the average for that brewery.
In the example given above, we used a horizontal boxplot to represent the rating. This could of
course be represented by some kind of start system or even just a number. We feel this
could end up being a little misleading because we're throwing out the distributional information
contained in the dataset. After then the intended behavior would be a user to click on a brewery
of interest and this would add on new rows that would represent each beer that brewery has created.
With similar information to the brewery itself.

This method for visualizing the data has a couple issues though. The main one being that we don't want
to create a table with over 5000 rows. We wouldn't be simplifying the dataset enough.
To solve this problem we would like to be able to grab the lat/long of the breweries in the dataset,
and draw them on a map. From there the user would be able to add a selection to the map which would
filter down the rows in the table to just the breweries selected in the area.

## Visualizing Review Timestamp Information

Another idea we had was to look at the timestamps by user, and see if peoples subjective opinions of
beer change throughout the night as they drink more. Ultimately however we thought this would be
unreasonably difficult to create a visualization for. With the biggest issue being how we aggregate the user data together.
Not to mention any inconsistency in the data that we would need to account for. So we ultimately decided against this idea, but we did
draft a sample visualization of what that may look like.

![Example Time Vis](process_img/time_vis.jpg)

## Stacked Distribution

In order to show the rating distribution differences between different beer styles, we could use a stacked histogram or distribution plot. The user would be able to select specific beer styles to compare or display a summary of all ratings.

This kind of plot would be relatively lightweight compared to our other ideas as we could pre-process the data and draw the plot with a small summary dataset.

![Example Stacked Vis](process_img/stacked_vis.jpg)

## Proposed Visualization

After reviewing our visualization ideas we decided that trying to build something relating to the timestamp information was really
not feasible. Our proposed visualization incorporates the idea of the stacked distribution and the fitler-able table into the final design.

The core of the design is of a dig-down style. The envisioned use would be to filter a table of all breweries to ones of interest, for instance breweries near me. Then for the user to select the brewery they're interested in which would hide the table, and bring up a 'dashboard' for the brewery. Which has a list of beers grouped by style, as well as a group a distributions histograms for that brewery, for the 5 interesting review metrics(Overall, Aroma, Appearance, and Taste).

![Proposed Vis Screen 1](process_img/final_vis_1.jpg)

![Proposed Vis Screen 2](process_img/final_vis_2.jpg)

# Must-Have Features

<!-- List the features without which you would consider your project to be a failure. -->

A filterable table that summarizes a selection, either of beer style or brewery. We need to be able to look at a subset of the data because trying to plot or build a table of the whole dataset will be prohibitively intensive.

We also need to have some kind of map showing geographic distribution of breweries. This may or may not be interactive, and may or may not display every brewery represented in the dataset.

When a brewery is selected from the table, a "dashboard" of information will be displayed, such as a "top 10" of individual beers, as well as a ratings breakdown by style.

# Optional Features

<!-- List the features which you consider to be nice to have, but not critical. -->

The map will be interactive, allowing brushing to select a subset to display in the table and will contain every brewery.
This will be difficult as getting this data requires pulling from Google Maps or some similar map database.

"falling" and "dropping" animations when styles are selected or deselected from the stacked distribution plot.

# Project Schedule

<!-- Make sure that you plan your work so that you can avoid a big rush right before the final project deadline, and delegate different modules and responsibilities among your team members. Write this in terms of weekly deadlines. -->
