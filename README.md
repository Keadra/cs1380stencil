

# M5: Distributed Execution Engine

> Add your contact information below and in `package.json`.

* name: `<Chengye Hao?>`

* email: `<chengye_hao@brown.edu?>`

* cslogin: `<chao6?>`
## Summary

> Summarize your implementation, including key challenges you encountered. Remember to update the `report` section of the `package.json` file with the total number of hours it took you to complete each task of M5 (`hours`) and the lines of code per task.


My implementation comprises `1` new software components, totaling `140` added lines of code over the previous implementation. Key challenges included `processing map function return values: My initial implementation contains empty return from map functions when non-empty returns are expected. I sovled it by thoroughly debug the map reduce process and add handling for return formats.`.


## Correctness & Performance Characterization

> Describe how you characterized the correctness and performance of your implementation


*Correctness*: I wrote <5> cases testing <word counting, maximum value finding, string concatenation, conditional filtering with map reduce>.


*Performance*: My <word frequency> can sustain <1500> <words>/second, with an average latency of <0.6> seconds per <document>.


## Key Feature

> Which extra features did you implement and how?

I did not attempt to implement any extra features on this assignment. 