import React, { Component } from "react";
import PropTypes from "prop-types";

class Tab extends Component {
  static propTypes = {
    activeTab: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  };

  onClick = () => {
    const { label, onClick } = this.props;
    onClick(label);
  };

  render() {
    const {
      onClick,
      props: { activeTab, label },
    } = this;

    let className = "tab";

    if (activeTab === label) {
      className += " active";
    }

    const style = {
      display: 'inline-block',
    };

    return (
      <button className={className} onClick={onClick} style={style}>
        {label}
      </button>
    );
  }
}

export default Tab;