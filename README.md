This repository provides a Node-RED RM implementing of the EN50491-12-2 "S2" standard for home and building energy management.

The Customer Energy Manager (CEM) is a key component in the S2 protocol that acts as an intermediary between external energy services/markets and the local energy resources within a building. It communicates with Resource Managers (RMs) to optimize and coordinate the power consumption of flexible energy resources like:

- Home batteries
- Electric vehicle chargers
- Heat pumps
- Smart appliances
- PV systems

This is part of the EN50491-12-2 European standard that defines protocols for smart grid applications in buildings. The CEM helps enable demand response and energy optimization by managing these flexible resources based on various factors like energy prices, grid conditions, and user preferences.

This repository is developed as an extention to the GitHub repo https://github.com/flexiblepower/s2-ws-json, using the definitions there to create the nodes for this repository.


