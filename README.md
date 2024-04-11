# Slow UI Virtualization

## How to use

### Download data

Visit [Slow UI Inspect](https://kibana.int.ringcentral.com/s/default/app/dashboards#/view/6cef69f0-f6e4-11ee-be27-ad6f8298320a?_g=(filters%3A!()%2Cquery%3A(language%3Akuery%2Cquery%3A'')%2CrefreshInterval%3A(pause%3A!t%2Cvalue%3A0)%2Ctime%3A(from%3Anow-2w%2Cto%3Anow)) to download the data.

![img.png](/assets/download-data.gif)


### Visualize the data

1. visit http://slow-ui-virtualization.app.int.rclabenv.com
2. upload your data

![view-chart](/assets/view-chart.mov)

## What the chart means

![](/assets/demo.png)

- Categorized by Element Path hierarchy
- The size of the box represents the avg time

## Development

1. Install Dependencies

```bash
npm install
```

2. View the demo

```bash
npm start
```

Now you can view the demo at [http://localhost:5173](http://localhost:8080)

