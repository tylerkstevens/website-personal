---
title: "Solar Swimming Pool Heating - Thermo-Economic Analysis"
description: "How much money can be saved on heating bills with a solar swimming pool system upgrade? What are the costs to upgrade? Is it worth it? When will it pay itself off?"
pubDate: "June 24 2021"
heroImage: "/portfolioimages/portfolio2/solar_poolheater_upgrade.png"
tags: ["thermodynamics","energy","economics"]
---

To follow along with my hand written work or view the code print out, download the Thermo-Economic model [here](/downloads/Solar_PoolHeating_Model.pdf).

This analysis was performed with [Engineering Equation Solver (EES)](https://fchartsoftware.com/ees/), a non-linear equation solver that includes various resources for thermodynamics, heat transfer, unit handling, and economic functions.

## Introduction

If you live in a sunny climate that can still be cold, like the high desert of the Rocky Mountain front range, you may have thought about adding solar panels to your home. But what about using solar energy for heat? Can a system be installed to adequately heat your swimming pool to a comfortable temperature throughout the year?

In this analysis, I investigated upgrading a traditional heated pool with solar collector as a method to reduce natural gas water heating costs.

Solar flux collectors, also commonly known as solar thermal collectors, are used for various applications, including heating swimming pools. These systems capture and convert solar energy into heat energy, which is then transferred to a fluid (usually water or a glycol mixture) circulating through the collector. This heated fluid can then be used to heat water in a swimming pool, reducing the dependency on conventional energy sources such as natural gas or electricity.

You can read more about how they work, [here](https://www.energy.gov/energysaver/solar-swimming-pool-heaters).

## Baseline System

### Known Parameters - Baseline

### States & Balances - Baseline

#### State [4-1] - Pool

#### State [1] - Pump Inlet

#### State [1-2] - Water Pump

#### State [2] - Pump Outlet

#### State [2-3] - Piping

#### State [3] - Water Heater Inlet

#### State [3-4] - Water Heater

#### State [4] - Heater Outlet

### Performance Calculations - Baseline

### Economic Calculations - Baseline

## Solar Modified System

### Known Parameters - Modified

### States & Balances - Modified

#### State [2-3] - Solar Flux Collector

#### State [3] - Solar Collector Outlet

### Performance Calculations - Modified

### Economic Calculations - Modified

## Economic Comparison

## Conclusion
