import React from 'react'
import clsx from 'clsx'
import styles from './styles.module.css'
import MoutainSvg from '@site/static/img/undraw_docusaurus_mountain.svg'
import TreeSvg from '@site/static/img/undraw_docusaurus_tree.svg'
import ReactSvg from '@site/static/img/undraw_docusaurus_react.svg'

interface FeatureItem {
  title: string
  Svg: React.ComponentType<React.ComponentProps<'svg'>>
  description: JSX.Element
}

const FeatureList: FeatureItem[] = [
  {
    title: '轻量便捷',
    Svg: MoutainSvg,
    description: (
      <>
        Neos运行在浏览器上，不用下载客户端，游玩便捷。
      </>
    )
  },
  {
    title: '联机对战',
    Svg: TreeSvg,
    description: (
      <>
        Neos支持和ygo客户端联机对战，也可以和另一个Neos网页进行对战，
        同时支持局域网联机。
      </>
    )
  },
  {
    title: '新卡快体验',
    Svg: ReactSvg,
    description: (
      <>
        当srvpro后端加入了新的游戏王卡片后，Neos无需下载更新玩家即可体验到新卡的乐趣。
      </>
    )
  }
]

function Feature ({ title, Svg, description }: FeatureItem): JSX.Element {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures (): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
