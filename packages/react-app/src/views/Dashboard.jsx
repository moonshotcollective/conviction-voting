import { Button, Card, Col, Divider, List, notification, Row, Switch } from "antd";
import { ethers } from "ethers";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Gauge } from "../components";

const Dashboard = ({ readContracts, writeContracts, address, tx, ...props }) => {
  const [currentGaugeId, setCurrentGaugeId] = useState();
  const [gaugeId, setGaugeId] = useState();
  const [gauges, setGauges] = useState([
    // mock gauges
    // { id: 1, score: 0 },
    // { id: 2, score: 0 },
    // { id: 3, score: 0 },
    // { id: 4, score: 0 },
  ]);
  const [action, setAction] = useState(true);
  const [amount, setAmount] = useState(0);
  const [loadingGauge, setLoadingGauge] = useState(false);
  const [loading, setLoading] = useState(false);
  const [approval, setApproval] = useState(0);
  const [lengthOfTime, setLengthOfTime] = useState(0);
  const [score, setScore] = useState(0);
  const [gtcBalance, setGtcBalance] = useState(0);

  const onSwitchChange = e => {
    setAction(e);
  };

  const addGauge = async () => {
    setLoadingGauge(true);
    await tx(writeContracts?.ConvictionVoting?.addGauge(), async update => {
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log(" 🍾 Transaction " + update.hash + " finished!");
        console.log(
          " ⛽️ " +
            update.gasUsed +
            "/" +
            (update.gasLimit || update.gas) +
            " @ " +
            parseFloat(update.gasPrice) / 1000000000 +
            " gwei",
        );
        notification.success({
          placement: "topRight",
          message: "Gauge Added",
        });
      }
    });
    setLoadingGauge(false);
  };

  const addConviction = async () => {
    setLoading(true);
    await tx(writeContracts?.ConvictionVoting?.addConviction(address, currentGaugeId, amount), async update => {
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log(" 🍾 Transaction " + update.hash + " finished!");
        console.log(
          " ⛽️ " +
            update.gasUsed +
            "/" +
            (update.gasLimit || update.gas) +
            " @ " +
            parseFloat(update.gasPrice) / 1000000000 +
            " gwei",
        );
        notification.success({
          placement: "topRight",
          message: "Your Conviction is Noted",
        });
      }
    });
    setLoading(false);
  };

  const submitConviction = async action => {
    if (action === true) {
      await addConviction();
    } else if (action === false) {
      // await removeConviction();
    }
  };

  const getConvictionScoreForGaugeWithId = async id => {
    // fetch the current total conviction score for a gauge
    await readContracts?.ConvictionVoting?.calculateConvictionScoreForGauge(id).then(x => {
      console.log("Score for gauge: ", x.toString());
      setScore(x.toString());

      return x.toString();
    });
  };

  useEffect(() => {
    const getApprovedAmount = async () => {
      await readContracts?.GTC?.allowance(address, readContracts?.ConvictionVoting?.address).then(r => {
        console.log("Allowance for CV: ", r.toString());
        setApproval(r.toString());
      });
    };

    return () => {
      getApprovedAmount();
    };
  }, [address, readContracts?.ConvictionVoting, readContracts?.GTC]);

  useEffect(() => {
    const getGtcBalance = () => {
      readContracts?.GTC?.balanceOf(address).then(result => {
        setGtcBalance(result.toString());
      });
    };

    return () => {
      getGtcBalance();
    };
  }, [address, readContracts?.GTC]);

  useEffect(() => {
    const getCurrentGaugeId = async () => {
      await readContracts?.ConvictionVoting?.currentGaugeId().then(result => {
        setCurrentGaugeId(result.toString());
      });
    };

    return () => {
      getCurrentGaugeId();
    };
  }, [address, readContracts?.ConvictionVoting]);

  useLayoutEffect(() => {
    let getGaugeInfo;
    getGaugeInfo = async () => {
      await readContracts?.ConvictionVoting?.currentGaugeId().then(async gaugeId => {
        for (let index = 1; index < gaugeId.toString(); index++) {
          await readContracts?.ConvictionVoting?.calculateConvictionScoreForGauge(index).then(score => {
            console.log("Score for Gauge ", `${index}: `, score.toString());
            // load up the gauges with the id and the score
            // { id: 0, score: 0 } sample

            setGauges(prevState => {
              // not working quite right...
              return [...prevState, { id: index, score: ethers.utils.formatUnits(score.toString(), 8) }];
            });
          });
        }
      });
    };

    return () => {
      getGaugeInfo();
    };
  }, [address, gaugeId, readContracts?.ConvictionVoting]);

  return (
    <div style={{ margin: "20px" }}>
      <Divider>Show Your Conviction</Divider>
      <Row align="center">
        <Col span={6} style={{ border: "1px solid", margin: "20px", padding: "25px" }}>
          <span>Current Gauge {gaugeId === 0 ? "Not Selected" : gaugeId}</span>
          <br />
          <div className="">
            Score:{" " + ethers.utils.formatUnits(score, 8)}
            <Gauge className="mt-6" />
          </div>
          <Button loading={loadingGauge} className="mt-5 bg-purple-700 hover:bg-purple-300" onClick={() => addGauge()}>
            Add Gauge
          </Button>
        </Col>
        <Col span={12} style={{ border: "1px solid", margin: "20px", padding: "25px" }}>
          <Switch
            className="right-9 m-4 bg-purple-600"
            checkedChildren="Stake"
            unCheckedChildren="Unstake"
            defaultChecked
            onChange={onSwitchChange}
          />
          <span className="m-5">{action === true ? "Stake" : "Unstake"} Your Conviction</span>
          <br />
          <label>Gauge Id: </label>
          <input
            className="w-60 m-4 bg-transparent border-2 p-1"
            value={gaugeId}
            onChange={e => {
              setGaugeId(e.target.value);
              getConvictionScoreForGaugeWithId(e.target.value);
            }}
          />
          <br />
          <label>Amount: </label>
          <input
            className="w-60 m-4 bg-transparent border-2 p-1"
            value={amount}
            onChange={e => {
              setAmount(e.target.value);
            }}
          />
          <br />
          {/* <label>Length of Time: </label>
          <Input
            value={lengthOfTime}
            onChange={e => {
              setLengthOfTime(e.target.value);
            }}
          />
          <br /> */}
          {!approval > 0 ? (
            <Button
              className="mt-10 bg-purple-700 hover:bg-purple-300"
              loading={loading}
              onClick={() => submitConviction(action)}
            >
              Submit
            </Button>
          ) : (
            <Button className="mt-10 bg-purple-700 hover:bg-purple-300" loading={loading}>
              Approve
            </Button>
          )}
        </Col>
      </Row>
      <Divider>Gauges</Divider>
      <Row>
        <Col span={24}>
          <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={gauges}
            renderItem={item => (
              <List.Item>
                <Card
                  className="cursor-pointer"
                  title={"Gauge Id: " + item.id}
                  onClick={e => {
                    setGaugeId(item.id);
                    getConvictionScoreForGaugeWithId(item.id);
                  }}
                >
                  Total Gauge Score: {item.score}
                </Card>
              </List.Item>
            )}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
