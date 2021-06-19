import React, { useState, useEffect } from "react";
import "./Facts.css";
// import responseFacts from "../../fixtures/responseFacts";
import Photo from "../../components/photo/Photo";
import InfoBadge from "../../components/infoBadge/InfoBadge";
import Loader from "../../components/loader/Loader";
import axios from "axios";
import {
  motion,
  useViewportScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { v1 as uuidv1 } from "uuid";
import ErrorMessage from "../../components/error-message/ErrorMessage";
import ScrollProgress from "../../components/scroll-progress/ScrollProgress";

const infoVariants = {
  enter: {
    scale: 0,
    opacity: 0,
  },
  center: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 1,
    },
  },
};

const resultsVariants = {
  enter: {
    x: "-100vw",
    opacity: 0,
  },
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring", stiffness: 500, duration: 0.5 },
      opacity: { duration: 0.5 },
    },
  },
};

const Facts = () => {
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [someError, setSomeError] = useState(false);
  const [facts, setFacts] = useState([]);

  const [isComplete, setIsComplete] = useState(false);
  const { scrollYProgress } = useViewportScroll();
  const yRange = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const pathLength = useSpring(yRange, { stiffness: 400, damping: 90 });

  useEffect(() => yRange.onChange(v => setIsComplete(v >= 1)), [yRange]);

  useEffect(() => {
    setLoadingRecords(true);
    const source = axios.CancelToken.source();
    axios
      .get("https://api.thedogapi.com/v1/breeds", {
        cancelToken: source.token,
      })
      .then(response => {
        setFacts(response.data);
        setLoadingRecords(false);
        setSomeError(false);
      })
      .catch(error => {
        if (axios.isCancel(error)) {
          console.log(" >> request cancelled ");
        } else {
          console.log(error);
          setLoadingRecords(false);
          setSomeError(true);
        }
      });

    return () => {
      source.cancel();
    };
  }, []);

  if (loadingRecords) {
    return (
      <div className="facts">
        <div className="facts__loaderContainer">
          <Loader loaderImg="/images/loader-1.gif"></Loader>
        </div>
      </div>
    );
  }
  if (someError) {
    return (
      <div className="facts">
        <div className="facts__errorMsgContainer">
          <ErrorMessage></ErrorMessage>
        </div>
      </div>
    );
  }

  return (
    <div className="facts">
      <div className="facts__resultHeading">
        <span className="facts__scrollProgressContainer">
          <ScrollProgress
            isComplete={isComplete}
            pathLength={pathLength}
          ></ScrollProgress>
        </span>
        <motion.h1 variants={resultsVariants} initial="enter" animate="center">
          Exhibiting <span>{facts.length}</span>Records
        </motion.h1>
      </div>

      {facts.map((fact, index) => (
        <motion.div
          className="facts__container"
          key={fact.id}
          variants={infoVariants}
          initial="enter"
          animate="center"
        >
          <div className="facts__info">
            <div className="facts__badgeWrapper">
              <span>{index + 1}</span>
            </div>
            <InfoBadge labelStatic="Name" labelDynamic={fact.name}></InfoBadge>
            <InfoBadge
              labelStatic="Breed Group"
              labelDynamic={fact.breed_group}
            ></InfoBadge>
            <InfoBadge
              labelStatic="Origin"
              labelDynamic={fact.origin}
            ></InfoBadge>
            <InfoBadge
              labelStatic="Temperament"
              labelDynamic={fact.temperament}
            ></InfoBadge>
            <InfoBadge
              labelStatic="Bred For"
              labelDynamic={fact.bred_for}
            ></InfoBadge>
            <InfoBadge
              labelStatic="Life Span"
              labelDynamic={fact.life_span}
            ></InfoBadge>
            <InfoBadge
              labelStatic="Weight"
              labelDynamic={`Imperial: "${fact.weight.imperial}" & Metric: "${fact.weight.metric}"`}
            ></InfoBadge>
            <InfoBadge
              labelStatic=" Height"
              labelDynamic={`Imperial: "${fact.height.imperial}" & Metric: "${fact.height.metric}"`}
            ></InfoBadge>
          </div>
          <div className="facts__imageContainer">
            <h1 className="facts__nameHeading">{fact.name}</h1>
            <div>
              <Photo imageUrl={fact.image.url} altName={fact.name}></Photo>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Facts;
