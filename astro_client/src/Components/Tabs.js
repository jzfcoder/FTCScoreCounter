import React, { Component } from "react";
import PropTypes from "prop-types";
import Tab from "./Tab";
import { Link } from "react-router-dom";

class Tabs extends Component {
  static propTypes = {
    children: PropTypes.instanceOf(Array).isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      activeTab: this.props.children[0].props.label,
    };

  }

  onClickTabItem = (tab) => {
    this.setState({ activeTab: tab });
  };

  render() {
    const {
      onClickTabItem,
      findTotalSum,
      props: { children },
      state: { activeTab },
    } = this;

    return (

      <div>
        <div className="tab">
          <Link to="/">
            <button className="tablinks">&lt; back</button>
          </Link>
          {
            /* eslint-disable-next-line */
            children.map((child) => {
              const { label } = child.props;

              return (
                <Tab
                  activeTab={activeTab}
                  key={label}
                  label={label}
                  onClick={onClickTabItem}
                />
              );
            })
          }

          <button className="total">Total: {this.props.total}</button>
        </div>

        <div>
          {
            children.map((child) => {
              if (child.props.label !== activeTab) return <div style={{ display: 'none' }} onClick={findTotalSum} key={child.props.label}>{child.props.children}</div>;
              return <div onClick={findTotalSum} className="main" key={child.props.label}>{child.props.children}</div>;
            })
          }
        </div>
      </div>
    );
  }
}

export default Tabs;