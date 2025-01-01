## TradeScreener Setup

### Prerequisites

- Ensure you have `curl` installed on your system.
- Install Miniconda by running the following commands:

```sh
mkdir -p ~/miniconda3
curl https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-arm64.sh -o ~/miniconda3/miniconda.sh
bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3
rm ~/miniconda3/miniconda.sh
```

### Create and Activate Conda Environment

1. Create a new conda environment with Python 3.10:

   ```sh
   conda create -n tradeenv python=3.10
   ```

2. Activate the newly created environment:

   ```sh
   conda activate tradeenv
   ```

### Install Required Packages

- Install the necessary Python packages:

  ```sh
  pip install pandas
  pip install fyers-apiv3
  ```

### Deactivate Environment

- Once done, you can deactivate the environment using:

  ```sh
  conda deactivate
  ```

### Usage

- To start using the TradeScreener, activate the environment:

  ```sh
  conda activate tradeenv
  ```

- Run your scripts or Jupyter notebooks as needed.

### Additional Information

- For more details on using Miniconda and managing environments, refer to the [Miniconda documentation](https://docs.conda.io/en/latest/miniconda.html).
- For more information on the `fyers-apiv3` package, visit the [official documentation](https://fyers-api-v2.readthedocs.io/en/latest/).
