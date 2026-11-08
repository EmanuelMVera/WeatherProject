import styles from "./AppFooter.module.css";

const ext = { target: "_blank", rel: "noopener noreferrer" };

/** Información sobre la app, fuentes de datos (atribuciones obligatorias) y aviso de uso. */
export default function AppFooter() {
  return (
    <footer className={styles.footer}>
      <section id="acerca" className={styles.about} aria-labelledby="acerca-titulo">
        <h2 id="acerca-titulo" className={styles.title}>
          Acerca de Buen Clima
        </h2>
        <div className={styles.columns}>
          <div>
            <h3>Qué es</h3>
            <p>
              Una forma rápida de saber qué tiempo hace y cómo va a estar en cualquier ciudad, pensada
              para organizar el día y las actividades al aire libre. Es gratuita, no requiere cuenta y
              tus favoritos se guardan sólo en este dispositivo.
            </p>
          </div>
          <div>
            <h3>De dónde salen los datos</h3>
            <ul>
              <li>
                Pronóstico: <a href="https://open-meteo.com/" {...ext}>Open-Meteo.com</a> (
                <a href="https://creativecommons.org/licenses/by/4.0/deed.es" {...ext}>CC BY 4.0</a>).
              </li>
              <li>Localidades: GeoNames, a través de Open-Meteo.</li>
              <li>
                Alertas: <a href="https://www.smn.gob.ar/alertas" {...ext}>Servicio Meteorológico Nacional</a>{" "}
                (CC BY 4.0), sólo para Argentina.
              </li>
            </ul>
          </div>
          <div>
            <h3>Para tener en cuenta</h3>
            <p>
              Los pronósticos son estimaciones de modelos numéricos y pueden cambiar. Las horas se
              muestran en la hora local de la ciudad consultada. Ante fenómenos severos, seguí siempre
              las indicaciones de los organismos oficiales.
            </p>
          </div>
        </div>
      </section>
      <p className={styles.copy}>Buen Clima · Tu pronóstico, claro y sin vueltas.</p>
    </footer>
  );
}
